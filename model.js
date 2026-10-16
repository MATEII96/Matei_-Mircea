/* Model didactic de curent mareic; nu reprezintă o curbă Tocardo certificată. */
(function(root){
const PERIOD=12.42, RHO=1025, DIAMETER=5.5, RATED=250, CUT_IN=0.4;
function sample(t,c){
 const velocity=c.vmax*Math.sin(2*Math.PI*t/PERIOD);
 const available=0.5*RHO*Math.PI*(DIAMETER/2)**2*(c.eff/100)*Math.abs(velocity)**3/1000;
 const perTurbine=c.enabled&&Math.abs(velocity)>=CUT_IN?Math.min(RATED,available):0;
 return {velocity,power:c.count*perTurbine,available,limited:available>=RATED&&c.enabled};
}
function energy(hours,c){
 if(hours<=0)return 0;
 const steps=Math.max(1,Math.ceil(hours*120)),dt=hours/steps;
 let sum=0.5*(sample(0,c).power+sample(hours,c).power);
 for(let i=1;i<steps;i++)sum+=sample(i*dt,c).power;
 return sum*dt/1000;
}
const api={PERIOD,RHO,DIAMETER,RATED,CUT_IN,sample,energy};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TidalModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
