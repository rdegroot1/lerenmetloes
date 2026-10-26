// Preserve the actual button between taps, including focus and pointer target.
// Replacing a whole grid during a click can interrupt a quick second tap.
export function updateBoard(element,markup,puzzleId){
 if(element.dataset.puzzle!==puzzleId){element.innerHTML=markup;element.dataset.puzzle=puzzleId;return;}
 const template=document.createElement('template');template.innerHTML=markup;
 const next=[...template.content.children],current=[...element.children];
 if(next.length!==current.length){element.replaceChildren(...next);return;}
 next.forEach((fresh,i)=>{
  const old=current[i];
  if(old.tagName!==fresh.tagName||old.dataset.cell!==fresh.dataset.cell){old.replaceWith(fresh);return;}
  for(const attr of [...old.attributes])if(!fresh.hasAttribute(attr.name))old.removeAttribute(attr.name);
  for(const attr of fresh.attributes)if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
  if(old.innerHTML!==fresh.innerHTML)old.innerHTML=fresh.innerHTML;
 });
}
