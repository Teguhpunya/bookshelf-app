/* Constants */
const KEY_LISTBOOK = "LIST_BOOK";
const DIALOG_DELETE = "Yakin ingin menghapus buku ini?";
const COMPLETED = true;

/* Variables */
let listBooks;
let listUnreadBooks;
let listReadBooks;

/* Elements */
// New book
const inTitle = document.getElementById("inputBookTitle");
const inAuthor = document.getElementById("inputBookAuthor");
const inYear = document.getElementById("inputBookYear");
const inIsComplete = document.getElementById("inputBookIsComplete");
const bookSubmit = document.getElementById("inputBook");
// Search book
const inSearchTitle = document.getElementById("searchBookTitle");
const searchSubmit = document.getElementById("searchBook");
// Book list
const unreadContainer = document.getElementById("incompleteBookshelfList");
const readContainer = document.getElementById("completeBookshelfList");
// Buttons
const btnBookSubmit = document.getElementById("bookSubmit");

/* Classes */
class Book {
  constructor(id, title, author, year, isComplete) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.year = year;
    this.isComplete = isComplete | false;
  }
}

/* Functions/Methods */
// Form
const resetForm = () => {
  inSearchTitle.value = "";
};

// Storage
const getList = (keyList) => {
  return localStorage.getItem(keyList);
};
const setList = (keyList, list) => {
  const stringsData = JSON.stringify(list);
  localStorage.setItem(keyList, stringsData);
};
const parseList = (keyList) => {
  const json = JSON.parse(getList(keyList));
  const list = [];
  if (json) {
    for (item of json) {
      list.push(Object.assign(new Book(), item));
    }
  }
  return list;
};

// Filter books
const filterByProgress = (list, progress) => {
  const result = [];
  list.forEach((book) => {
    if (book.isComplete == progress) result.push(book);
  });
  return result;
};
const filterByTitle = (list, title) => {
  const result = [];
  list.forEach((book) => {
    const bookTitle = book.title;
    if (bookTitle.includes(title)) result.push(book);
  });
  return result;
};

// Modify book
const addBook = (list, newBook) => {
  const newList = list;
  newList.push(newBook);
  return newList;
};
const toggleProgressBook = (list, id) => {
  const result = list;
  const index = result.map((item) => item.id).indexOf(id);
  result[index].isComplete = !result[index].isComplete;
  return result;
};
const delBook = (list, id) => {
  const result = list;
  const index = result.map((item) => item.id).indexOf(id);
  result.splice(index, 1);
  return result;
};

// Events
const eventAddBook = (list) => {
  const [id, title, author, year, isComplete] = [
    +new Date(),
    inTitle.value,
    inAuthor.value,
    inYear.value,
    inIsComplete.checked,
  ];
  const newBook = new Book(id, title, author, year, isComplete);
  const newList = addBook(list, newBook);
  setList(KEY_LISTBOOK, newList);
  renderAllList(newList);
};

const eventProgressBook = (list, id) => {
  const newList = toggleProgressBook(list, id);
  setList(KEY_LISTBOOK, newList);
  renderAllList(newList);
};

const eventDelBook = (list, id) => {
  resetForm();

  const newList = delBook(list, id);
  setList(KEY_LISTBOOK, newList);
  renderAllList(newList);
};

const eventSearchBook = (list) => {
  const query = inSearchTitle.value;
  const newList = filterByTitle(list, query);
  renderAllList(newList);
};

/* Templates */
const templateBookItem = (book) => {
  const { id, title, author, year, isComplete } = book;
  const newArticle = document.createElement("article");
  newArticle.className = "book_item";

  newArticle.innerHTML = `
    <h3>${title}</h3>
    <p>Penulis: ${author}</p>
    <p>Tahun: ${year}</p>
  `;

  // Action container
  const newAction = document.createElement("div");
  newAction.className = "action";

  // Progress button
  const btnProg = document.createElement("button");
  btnProg.className = "green";
  btnProg.innerText = `${isComplete ? "Belum dibaca" : "Selesai dibaca"}`;
  btnProg.onclick = () => eventProgressBook(listBooks, id);

  // Delete button
  const btnDel = document.createElement("button");
  btnDel.className = "red";
  btnDel.innerText = "Hapus buku";
  btnDel.onclick = () => eventDelBook(listBooks, id);

  // Append all to article
  newAction.append(btnProg, btnDel);
  newArticle.append(newAction);

  return newArticle;
};

/* Render */
const renderList = (list, parentElement) => {
  parentElement.innerHTML = "";
  if (list) {
    list.forEach((book) => {
      parentElement.append(templateBookItem(book));
    });
  }
};

const renderAllList = (list) => {
  // listBooks = parseList(KEY_LISTBOOK);
  listUnreadBooks = filterByProgress(list, !COMPLETED);
  listReadBooks = filterByProgress(list, COMPLETED);

  renderList(listUnreadBooks, unreadContainer);
  renderList(listReadBooks, readContainer);
};

/* Main script*/
listBooks = parseList(KEY_LISTBOOK);

// Fetch lists
resetForm();
renderAllList(listBooks);

// New book
bookSubmit.addEventListener("submit", (event) => {
  eventAddBook(listBooks);
  event.preventDefault();
});

btnBookSubmit.querySelector("span").innerText = inIsComplete.checked
  ? "Selesai dibaca"
  : "Belum selesai dibaca";

inIsComplete.addEventListener("change", () => {
  btnBookSubmit.querySelector("span").innerText = inIsComplete.checked
    ? "Selesai dibaca"
    : "Belum selesai dibaca";
});

// Search book
searchSubmit.addEventListener("submit", (event) => {
  eventSearchBook(listBooks);
  event.preventDefault();
});
