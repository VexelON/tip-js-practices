const book = { id: 7, title: "Алгоритмы", available: true };
const changes = { title: "Новое название" };
const updated = { ...book, ...changes, id: book.id };

console.log(updated);
