function turnBack(pageNumber) {
  const paper = document.getElementById(`p${pageNumber}`);
  paper.classList.add("flipped");
  
  // Lower the z-index after the flip animation finishes
  setTimeout(() => {
    paper.style.zIndex = pageNumber;
  }, 250);
}

function turnForward(pageNumber) {
  const paper = document.getElementById(`p${pageNumber}`);
  paper.classList.remove("flipped");
  
  // Restore higher z-index dynamically
  setTimeout(() => {
    paper.style.zIndex = 10 - pageNumber; 
  }, 250);
}
