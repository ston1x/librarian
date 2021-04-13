const dropArea = document.getElementById('drop-area');

dropArea.addEventListener('dragover', (event) => {
  event.stopPropagation();
  event.preventDefault();
  // Style the drag-and-drop as a "copy file" operation.
  event.dataTransfer.dropEffect = 'copy';
});

dropArea.addEventListener('drop', (event) => {
  event.stopPropagation();
  event.preventDefault();
  const fileList = event.dataTransfer.files;
  validateType(fileList);
  console.log(fileList);
});

function validateType(fileList) {
  for (const file of fileList) {
    const type = file.type
    if (type != 'text/plain') alert("Only .txt files are supported");
  }
};
