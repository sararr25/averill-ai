/* Guided motion stays local, interruptible, and respects the system preference. */
const guidedMotion={
 reduced:matchMedia('(prefers-reduced-motion: reduce)'),
 enter(element,duration=220,distance=6){
  if(!element)return;
  element.getAnimations().forEach(animation=>animation.cancel());
  if(this.reduced.matches)return;
  element.animate([{opacity:0,transform:`translateY(${distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration,easing:'cubic-bezier(.22,1,.36,1)'});
 }
};
guidedMotion.reduced.addEventListener('change',event=>{if(event.matches)document.getAnimations().forEach(animation=>animation.cancel());});
function groupSetup(panel){
 const nodes=[...panel.children];
 const groups={};
 const group=(name,open=false)=>{
  if(groups[name])return groups[name];
  const details=document.createElement('details');details.className='setup-group';details.open=open;
  const summary=document.createElement('summary');summary.textContent=name;details.append(summary);panel.append(details);return groups[name]=details;
 };
 let section=null;
 for(const element of nodes){
  if(element.matches('.onboarding-section'))section=group('Company files',!current.onboarding?.applied);
  else if(element.matches('.workspace-keys'))section=group('AI and services');
  else if(element.matches('h3')&&/Advanced/.test(element.textContent))section=group('Advanced');
  else if(element.matches('h3')&&/department sources/.test(element.textContent))section=group('Company files',true);
  else if(element.matches('.account-management'))section=group('Team and account access');
  if(section)section.append(element);
 }
 for(const name of ['Company files','Team and account access','AI and services','Advanced'])if(groups[name])panel.append(groups[name]);
}
