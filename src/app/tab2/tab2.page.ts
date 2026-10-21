import { Component, OnDestroy, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { environment } from '../../environments/environment';

import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  Unsubscribe
} from 'firebase/firestore';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

const booksCol = collection(db, 'books');

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnDestroy {

  private readonly alertCtrl = inject(AlertController);
  private unsubscribeBooks: Unsubscribe | null = null;

  books: any[] = [];

  searchText = '';

  selectedGenre = 'All';

  filteredBooks: any[] = [];

  isModalOpen = false;

  isLoading = false;

  showToast = false;

  toastMessage = '';

  selectedBook: any = null;

  editBook = {
    title: '',
    author: '',
    readDate: '',
    genre: '',
    notes: ''
  };

  ionViewWillEnter() {
    this.subscribeToBooks();
  }

  ionViewDidLeave() {
    this.stopListeningToBooks();
  }

  ngOnDestroy() {
    this.stopListeningToBooks();
  }

  subscribeToBooks() {
    this.stopListeningToBooks();

    this.unsubscribeBooks = onSnapshot(booksCol, snapshot => {

      this.books = snapshot.docs.map(d => ({

        id: d.id,

        ...d.data()

      }));

      this.applyFilters();

    }, error => {
      console.error(error);
      this.showToastMessage('Failed to load books.');
    });

  }

  private stopListeningToBooks() {
    this.unsubscribeBooks?.();
    this.unsubscribeBooks = null;
  }


  applyFilters() {

    const search =
      this.searchText.toLowerCase();


    this.filteredBooks =
      this.books.filter(book => {

        const matchesSearch =

          book.title
            ?.toLowerCase()
            .includes(search)

          ||

          book.author
            ?.toLowerCase()
            .includes(search)

          ||

          book.genre
            ?.toLowerCase()
            .includes(search);


        const matchesGenre =

          this.selectedGenre === 'All'

          ||

          book.genre ===
          this.selectedGenre;


        return matchesSearch &&
               matchesGenre;

      });

  }


  searchChanged(event: any) {

    this.searchText =
      event.detail.value || '';

    this.applyFilters();

  }


  genreChanged(event: any) {

    this.selectedGenre =
      event.detail.value;

    this.applyFilters();

  }


  openEdit(book: any) {

    this.selectedBook = book;

    this.editBook = {

      title:
        book.title || '',

      author:
        book.author || '',

      readDate:
        book.readDate || '',

      genre:
        book.genre || 'Fiction',

      notes:
        book.notes || ''

    };

    this.isModalOpen = true;

  }


  closeModal() {

    this.isModalOpen = false;

  }


  async updateBook() {

    if (!this.selectedBook) {

      return;

    }

    this.isLoading = true;

    try {

      const bookRef = doc(
        db,
        'books',
        this.selectedBook.id
      );

      await updateDoc(bookRef, {

        title:
          this.editBook.title,

        author:
          this.editBook.author,

        readDate:
          this.editBook.readDate,

        genre:
          this.editBook.genre,

        notes:
          this.editBook.notes

      });

      this.isModalOpen = false;

      this.showToastMessage(
        'Book updated successfully!'
      );

    } catch (error) {

      console.error(error);

      this.showToastMessage(
        'Failed to update book.'
      );

    } finally {

      this.isLoading = false;

    }

  }


  async deleteBook(bookId: string) {

    const alert =
      await this.alertCtrl.create({

        header: 'Remove book',

        message:
          'Are you sure you want to delete this favorite?',

        buttons: [

          {
            text: 'Cancel',
            role: 'cancel'
          },

          {

            text: 'Delete',

            role: 'destructive',

            handler: async () => {

              try {

                await deleteDoc(
                  doc(
                    db,
                    'books',
                    bookId
                  )
                );

                this.showToastMessage(
                  'Book deleted successfully!'
                );

              } catch (error) {

                console.error(error);

                this.showToastMessage(
                  'Failed to delete book.'
                );

              }

            }

          }

        ]

      });


    await alert.present();

  }


  showToastMessage(message: string) {

    this.toastMessage = message;

    this.showToast = true;

  }

}