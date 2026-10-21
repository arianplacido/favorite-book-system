import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  addDoc
} from 'firebase/firestore';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

const booksCol = collection(db, 'books');

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  newBook = {
    title: '',
    author: '',
    readDate: '',
    genre: 'Fiction',
    notes: ''
  };

  isLoading = false;

  async addBook() {

    if (
      !this.newBook.title ||
      !this.newBook.author ||
      !this.newBook.readDate ||
      !this.newBook.genre
    ) {

      alert('Please complete all required fields.');

      return;
    }

    this.isLoading = true;

    try {

      await addDoc(booksCol, {

        title: this.newBook.title,
        author: this.newBook.author,
        readDate: this.newBook.readDate,
        genre: this.newBook.genre,
        notes: this.newBook.notes,

        createdAt: new Date()

      });

      alert('Book added to your favorites!');

      this.newBook = {

        title: '',
        author: '',
        readDate: '',
        genre: 'Fiction',
        notes: ''

      };

    } catch (error) {

      console.error(error);

      alert('Failed to add book.');

    } finally {

      this.isLoading = false;

    }

  }

}