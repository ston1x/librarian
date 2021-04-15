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
  if (!validateType(fileList)) return null;

  readFile(fileList[0]);
});

function validateType(fileList) {
  for (const file of fileList) {
    const type = file.type
    if (type != 'text/plain') {
      alert("Only .txt files are supported");
      return false;
    } else {
      return true;
    }
  }
};

function readFile(file) {
  const reader = new FileReader();
  const separator = '==========';
  const timestampRegex = /Added on */;

  reader.onload = function(event) {
    var contents = event.target.result;
    const notes = contents.split(separator);

    const parsed = notes.map(note => {
      var attributes = note.split("\n");
      var cleanedUpAttributes = attributes.filter(attr => attr !== "\r" && attr !== '');

      if (cleanedUpAttributes.length < 3) return null;

      var title = cleanedUpAttributes[0].replace(/[\n\r]+/g, '');
      var text = cleanedUpAttributes[2].replace(/[\n\r]+/g, '');
      var timestamp = cleanedUpAttributes[1].replace(/[\n\r]+/g, '').split(timestampRegex).filter(Boolean)[1];

      return [title, text, timestamp];
    }).filter(value => value);
    console.log(parsed);

    // TODO: Group by books
  };

  reader.readAsText(file);
}
