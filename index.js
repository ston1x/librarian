const dropArea = document.getElementById('drop-area');
const bookEmojis = ['📕', '📔', '📘', '📗', '📙', '📒', '📓'];

function download(element, filename, contents) {
  element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(contents));
  element.setAttribute('download', filename);
  element.classList.add("book-url")

}

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

      var title = cleanedUpAttributes[0].replace(/[\n\r]+/g, '').replace(/^\uFEFF/gm, '').replace(/^\u00BB\u00BF/gm,'');
      var text = cleanedUpAttributes[2].replace(/[\n\r]+/g, '');
      var timestamp = cleanedUpAttributes[1].replace(/[\n\r]+/g, '').split(timestampRegex).filter(Boolean)[1];

      return {title: title, text: text, timestamp: timestamp};
    }).filter(value => value);

    const groupByTitles = groupBy('title');
    const grouped = groupByTitles(parsed);

    console.log(grouped);

    booksTitles = Object.keys(grouped);

    document.getElementById('separator').innerHTML = '. . .';
    document.getElementById('status').innerHTML = '✨ Success! I found some notes:';

    let bookIndex = 0;
    for (const title in grouped) {
      amountOfNotes = grouped[title].length;

      renderBook(title, amountOfNotes, bookIndex);

      (bookIndex > bookEmojis.length) ? bookIndex = 0 : bookIndex++;
    }

    // TODO: Handle errors
    // TODO: Handle other languages? Check how Kindle behaves when other system languages are used
    // TODO: Generate CSV and/or Markdown
  };

  reader.readAsText(file);
}

function renderBook (title, amountOfNotes, bookIndex) {
  // create a new div element
  var newDiv = document.createElement("a");
  newDiv.id = `book-${bookIndex}`
  // and give it some content
  var paragraph = document.createElement("p");
  var newContent = document.createTextNode(`${bookEmojis[bookIndex]} ${title}: ${amountOfNotes}`);
  // add the text node to the newly created div
  paragraph.appendChild(newContent);
  newDiv.appendChild(paragraph);
  newDiv.classList.add("book")
  // add the newly created element and its content into the DOM
  var booksList = document.getElementById("books-list");
  var firstChild = booksList.firstChild;
  download(newDiv, 'hello.md', `# Hello \nThis was a title\n## And this is a heading`);
  booksList.insertBefore(newDiv, firstChild);
}

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
