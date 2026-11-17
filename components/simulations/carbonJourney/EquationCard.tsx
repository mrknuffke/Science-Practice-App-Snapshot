import React from 'react';
import { Equation, Element, Term, tally } from './carbonJourneyData';

const ELEMENTS: Element[] = ['C', 'H', 'O'];

const side = (terms: Term[]) =>
  terms.map((t, i) => (
    <React.Fragment key={i}>
      {i > 0 && <span className="mx-1.5 text-slate-400">+</span>}
      {t.coef > 1 && <span>{`${t.coef}\u00a0`}</span>}
      <span>{t.species.formula}</span>
    </React.Fragment>
  ));

/** The stage's equation with an atom count for each side, computed, never typed. */
const EquationCard: React.FC<{ equation: Equation }> = ({ equation }) => {
  const left = tally(equation.reactants);
  const right = tally(equation.products);
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-3">
      <div className="text-center font-mono font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 flex flex-wrap justify-center items-center">
        {side(equation.reactants)}
        <span className="mx-2 text-emerald-600 dark:text-emerald-400">{equation.reversible ? '⇌' : '→'}</span>
        {side(equation.products)}
      </div>
      <p className="text-center text-xs text-slate-600 dark:text-slate-300">{equation.words}</p>
      {equation.energyNote && (
        <p className="text-center text-xs font-bold text-orange-600 dark:text-orange-400">{equation.energyNote}</p>
      )}
      <table className="w-full max-w-xs mx-auto text-xs text-center">
        <caption className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1">
          Atom count
        </caption>
        <thead>
          <tr className="text-slate-500 dark:text-slate-400">
            <th className="font-semibold py-0.5" scope="col">Atom</th>
            <th className="font-semibold" scope="col">Before</th>
            <th className="font-semibold" scope="col">After</th>
          </tr>
        </thead>
        <tbody className="font-mono font-bold">
          {ELEMENTS.filter(el => left[el] || right[el]).map(el => (
            <tr key={el} className={el === 'C' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}>
              <th scope="row" className="py-0.5">{el}</th>
              <td>{left[el]}</td>
              <td>
                {right[el]} {left[el] === right[el] ? '✓' : '✗'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquationCard;
