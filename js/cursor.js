const translateCursor = (pageX,pageY) => {
let cursor = document.querySelector('#cursor')
let height = cursor.offsetHeight;
let width = cursor.offsetWidth;
let mouseX = pageX - width/2;
let mouseY = pageY - height/2;
cursor.style.top = mouseY+'px';
cursor.style.left = mouseX+'px';
}
(()=>{
const mouseCapture = (e) => {
  document.querySelector('#cursor').classList.remove('idle')
  translateCursor(e.pageX,e.pageY)
},
leaveDocument = (e) => {
  if(!e.relatedTarget && !e.toElement) {
    document.querySelector('#cursor').classList.add('idle')
  }
}
document.addEventListener('mousemove', mouseCapture);
document.addEventListener('mouseout', leaveDocument);

})()