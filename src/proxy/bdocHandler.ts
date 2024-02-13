import { Color, isNormal } from 'shogiops/types';
import { decode as decodeAnalysis } from '../lishogi/analysis/binary';
import { decode as decodeUsi } from '../lishogi/usi/binary';
import { decode as decodeClock } from '../lishogi/clockDecoder/clock/binary';
import { decode as decodeClockConfig } from '../lishogi/clockConfig/binary';
import { evalToWin, numberOfFiles, roleToIndex, speedByTotalTime, variant, winsToAccuracy } from '../util';
import { calculate } from '../lishogi/movetimes/calculate';
import { defaultPosition } from 'shogiops/variant/variant';
import { promote } from 'shogiops/variant/util';
import { defined, opposite, parseUsi } from 'shogiops/util';
import {
  Accuracy,
  Centis,
  CounterObj,
  PartialRecord,
  Game,
  Outcome,
  RoleIndex,
  Speed,
  Status,
  Variant,
} from '../types';
import { GameDocument } from './database';

export function processGameDocument(doc: GameDocument, by: string): Game {
  const color = doc.us.indexOf(by) === 0 ? 'sente' : 'gote';
  const v = doc.v || Variant.Standard;
  const opponentUsername = color === 'sente' ? doc.us[1] : doc.us[0];
  const me = color === 'sente' ? doc.p0 : doc.p1;
  const opponent = color === 'sente' ? doc.p1 : doc.p0;
  const usis = decodeUsi(new Uint8Array(doc.um.buffer), numberOfFiles(doc.v));

  const clockConfig = doc.c ? decodeClockConfig(new Uint8Array(doc.c.buffer)) : undefined;

  const movetimeBuffer = color === 'sente' ? doc.cw?.buffer : doc.cb?.buffer;
  const remainingTimes =
    movetimeBuffer && clockConfig
      ? decodeClock(new Uint8Array(movetimeBuffer), clockConfig.limit)
      : undefined;
  const periodBytes = color === 'sente' ? doc.pw?.buffer : doc.pb?.buffer;

  const movetimes =
    clockConfig && remainingTimes
      ? calculate(
          color,
          clockConfig,
          remainingTimes,
          periodBytes ? new Uint8Array(periodBytes) : undefined,
          usis.length,
          usis.length % 2 === 1 ? color : opposite(color),
          doc.s === Status.Outoftime,
        )
      : undefined;

  const speed = clockConfig
    ? speedByTotalTime(clockConfig.limit, clockConfig.inc, clockConfig.per, clockConfig.byo)
    : Speed.Correspondence;

  const status =
    doc.s === Status.Timeout ? Status.Outoftime : doc.s === Status.Cheat ? Status.UnknownFinish : doc.s;

  const analysis: (number | undefined)[] | undefined = doc.analysisData
    ? decodeAnalysis(doc.analysisData, color === 'gote').map(e => evalToWin(e))
    : undefined;

  let nbOfMovesAndDrops: number = 0,
    nbOfMoves: number = 0,
    nbOfDrops: number = 0,
    nbOfPromotions: number = 0,
    nbOfCaptures: number = 0,
    nbOfMovesByRole: CounterObj<RoleIndex> = {},
    nbOfDropsByRole: CounterObj<RoleIndex> = {},
    nbOfCapturesByRole: CounterObj<RoleIndex> = {},
    capturedBishopColor: Color | undefined = undefined,
    earlyTradedBishop: boolean = false,
    totalTimeOfMoves: Centis = 0,
    totalTimeOfDrops: Centis = 0,
    sumOfTimesByMoveRole: PartialRecord<RoleIndex, Centis> = {},
    sumOfTimesByDropRole: PartialRecord<RoleIndex, Centis> = {},
    accuracies: Accuracy[] = [],
    sumOfAccuracy: Accuracy = 0,
    sumOfAccuracciesByMoveRole: PartialRecord<RoleIndex, Accuracy> = {},
    sumOfAccuracciesByDropRole: PartialRecord<RoleIndex, Accuracy> = {};

  let turn: Color = 'gote';
  const rules = variant(doc.v),
    board = defaultPosition(rules).board,
    promotion = promote(rules);

  for (let i = 0; i < usis.length; i++) {
    turn = opposite(turn);

    const usi = parseUsi(usis[i]);

    let accuracy: Accuracy | undefined = undefined;

    const log = turn === color;
    const time = (movetimes && log && movetimes[Math.floor(i / 2)]) || 0;

    if (!usi) {
      console.error('Invalid USI:', usis[i], 'from game', doc._id);
      continue;
    }

    if (log) {
      nbOfMovesAndDrops++;
      const prevWinP = analysis && (i > 0 ? analysis[i - 1] : evalToWin([30, undefined])); // slight sente advantage
      const newWinP = analysis && analysis[i];
      accuracy =
        analysis && prevWinP !== undefined && newWinP !== undefined
          ? winsToAccuracy(prevWinP, newWinP)
          : undefined;
      if (accuracy !== undefined) {
        accuracy = Math.max(0, Math.min(accuracy, 100));
        accuracies.push(accuracy);
        sumOfAccuracy += accuracy;
      }
    }

    if (isNormal(usi)) {
      const old = board.take(usi.from);
      if (!old) continue;

      if (usi.promotion) old.role = promotion(old.role) || old.role;
      const captured = board.set(usi.to, old),
        secondCapture = defined(usi.midStep) ? board.take(usi.midStep) : undefined;

      if (v === Variant.Standard && captured?.role === 'bishop' && i < 15 && !earlyTradedBishop) {
        if (capturedBishopColor !== captured.color) earlyTradedBishop = true;
        else capturedBishopColor = captured.color;
      }

      if (log) {
        const roleIndex = roleToIndex(old.role);
        nbOfMoves++;
        nbOfMovesByRole[roleIndex] = (nbOfMovesByRole[roleIndex] || 0) + 1;
        if (usi.promotion) nbOfPromotions++;
        if (captured) {
          const capturedIndex = roleToIndex(captured.role);
          nbOfCaptures++;
          nbOfCapturesByRole[capturedIndex] = (nbOfCapturesByRole[capturedIndex] || 0) + 1;
        }
        if (secondCapture) {
          const capturedIndex = roleToIndex(secondCapture.role);
          nbOfCaptures++;
          nbOfCapturesByRole[capturedIndex] = (nbOfCapturesByRole[capturedIndex] || 0) + 1;
        }
        sumOfTimesByMoveRole[roleIndex] = (sumOfTimesByMoveRole[roleIndex] || 0) + time;

        if (accuracy !== undefined) {
          sumOfAccuracciesByMoveRole[roleIndex] = (sumOfAccuracciesByMoveRole[roleIndex] || 0) + accuracy;
        }

        totalTimeOfMoves += time;
      }
    } else {
      board.set(usi.to, {
        role: usi.role,
        color: turn,
      });
      if (log) {
        const roleIndex = roleToIndex(usi.role);
        nbOfDrops++;
        nbOfDropsByRole[roleIndex] = (nbOfDropsByRole[roleIndex] || 0) + 1;

        sumOfTimesByDropRole[roleIndex] = (sumOfTimesByDropRole[roleIndex] || 0) + time;

        if (accuracy !== undefined) {
          sumOfAccuracciesByDropRole[roleIndex] = (sumOfAccuracciesByDropRole[roleIndex] || 0) + accuracy;
        }

        totalTimeOfDrops += time;
      }
    }
  }

  return {
    id: doc._id,
    color: color,
    variant: v,
    outcome: doc.wid === by ? Outcome.Win : doc.wid !== undefined ? Outcome.Loss : Outcome.Draw,
    status: status,
    speed: speed,
    rated: !!doc.ra,
    date: doc.ua,
    computer: !!opponent?.ai,
    usis: usis,
    clockConfig: clockConfig,
    movetimes: movetimes,
    // moves
    nbOfMoves: nbOfMoves,
    nbOfDrops: nbOfDrops,
    nbOfCaptures: nbOfCaptures,
    nbOfPromotions: nbOfPromotions,
    nbOfMovesByRole: nbOfMovesByRole,
    nbOfDropsByRole: nbOfDropsByRole,
    nbOfCapturesByRole: nbOfCapturesByRole,
    initialLine:
      color === 'sente' && usis.length ? [usis[0]] : usis.length >= 2 ? [usis[0], usis[1]] : undefined,
    earlyBishopExchange: earlyTradedBishop,
    // opponent
    opponent: opponentUsername,
    opponentRating: opponent?.e,
    opponentRatingDiff: me?.e && opponent?.e ? me.e - opponent.e : undefined,
    // times
    totalTimeOfMoves: totalTimeOfMoves,
    totalTimeOfDrops: totalTimeOfDrops,
    sumOfTimesByMoveRole: sumOfTimesByMoveRole,
    sumOfTimesByDropRole: sumOfTimesByDropRole,
    // analysis
    accuracy: accuracies.length ? sumOfAccuracy / accuracies.length : undefined,
    accuracies: accuracies,
    sumOfAccuracyByMoveRole: sumOfAccuracciesByMoveRole,
    sumOfAccuracyByDropRole: sumOfAccuracciesByDropRole,
  };
}
