import React from 'react';
import { FbdForce } from '../../../types';
import { computeNetForce, getFxFy } from './fbdEngine';

interface FbdVectorPanelProps {
  forces: FbdForce[];
}

export const FbdVectorPanel: React.FC<FbdVectorPanelProps> = ({ forces }) => {
  const net = computeNetForce(forces);
  const isEquilibrium = net.magnitude < 2;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vector Components</h3>

      {forces.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Add forces to see their components.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-1.5 font-black text-slate-400 pr-2">Force</th>
                  <th className="text-right py-1.5 font-black text-slate-400 pr-2">|F| (N)</th>
                  <th className="text-right py-1.5 font-black text-slate-400 pr-2">θ (°)</th>
                  <th className="text-right py-1.5 font-black text-slate-400 pr-2">Fx (N)</th>
                  <th className="text-right py-1.5 font-black text-slate-400">Fy (N)</th>
                </tr>
              </thead>
              <tbody>
                {forces.map(f => {
                  const { fx, fy } = getFxFy(f);
                  return (
                    <tr key={f.id} className="border-b border-slate-50">
                      <td className="py-1.5 pr-2 font-bold" style={{ color: f.color }}>{f.label}</td>
                      <td className="py-1.5 pr-2 text-right font-mono text-slate-700">{f.magnitude.toFixed(1)}</td>
                      <td className="py-1.5 pr-2 text-right font-mono text-slate-700">{f.angle.toFixed(0)}</td>
                      <td className="py-1.5 pr-2 text-right font-mono text-slate-700">{fx.toFixed(1)}</td>
                      <td className="py-1.5 text-right font-mono text-slate-700">{fy.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="pt-2 pr-2 font-black text-slate-700 text-xs" colSpan={3}>Net Force (Σ)</td>
                  <td className="pt-2 pr-2 text-right font-mono font-black text-slate-800">{net.fx.toFixed(1)}</td>
                  <td className="pt-2 text-right font-mono font-black text-slate-800">{net.fy.toFixed(1)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={`mt-3 rounded-xl px-3 py-2 text-xs font-bold ${
            isEquilibrium
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-50 text-slate-700 border border-slate-200'
          }`}>
            {isEquilibrium ? (
              <>Fnet ≈ 0 N: <span className="font-black">Equilibrium</span></>
            ) : (
              <>|Fnet| = <span className="font-black">{net.magnitude.toFixed(1)} N</span> at <span className="font-black">{net.angleDeg.toFixed(0)}°</span></>
            )}
          </div>
        </>
      )}
    </div>
  );
};
