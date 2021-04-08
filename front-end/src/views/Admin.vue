<template>
<div class="admin">
  <h1>The Admin Page!</h1>
  <div v-if="this.user">
    <div v-if="this.user.username === 'Admin'">
      <div class="heading">
        <div class="circle">1</div>
        <h2>Add a Book</h2>
      </div>
      <div class="add">
        <div class="form">
          <input v-model="title" placeholder="Title">
          <p></p>
          <input v-model="series" placeholder="Series">
          <p></p>
          <input v-model="author" placeholder="Author">
          <p></p>
          <input type="file" name="photo" @change="fileChanged">
          <button @click="upload">Upload</button>
        </div>
        <div class="upload" v-if="addBook">
          <h2>{{addBook.title}}:</h2>
          <p>{{addBook.series}} </p>
          <p>{{addBook.author}} </p>
          <img :src="addBook.path" />
        </div>
      </div>
      <div class="heading">
        <div class="circle">2</div>
        <h2>Edit/Delete an Book</h2>
      </div>
      <div class="edit">
        <div class="form">
          <input v-model="findTitle" placeholder="Search">
          <div class="suggestions" v-if="suggestions.length > 0">
            <div class="suggestion" v-for="s in suggestions" :key="s.id" @click="selectBook(s)">{{s.title}}
            </div>
          </div>
        </div>
        <div class="upload" v-if="findBook">
          <input v-model="findBook.title" placeholder="Edit Title">
          <input v-model="findBook.series" placeholder="Edit Series">
          <input v-model="findBook.author" placeholder="Edit Author">
          <p></p>
          <img :src="findBook.path" />
        </div>
        <div class="actions" v-if="findBook">
          <button @click="deleteBook(findBook)">Delete</button>
          <button @click="editBook(findBook)">Edit</button>
        </div>
      </div>
    </div>
    <div v-else>
      <h3> Please sign in as Admin to access Admin information </h3>
    </div>
  </div> <!-- end first v-if div -->

  <div v-else>
    <h3> Please sign in as Admin to access Admin information </h3>
  </div>
</div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Admin',
  data() {
    return {
      title: "",
      file: null,
      addBook: null,
      books: [],
      findTitle: "",
      findBook: null,
      series: "",
      author: "",
      user: null,

    }
  },
  computed: {
    suggestions() {
      let books = this.books.filter(book => book.title.toLowerCase().startsWith(this.findTitle.toLowerCase()));
      return books.sort((a, b) => a.title > b.title);
    }
  },
  created() {
    this.getBooks();
    this.user = this.$root.$data.currentUser;
  },
  methods: {
    fileChanged(event) {
      this.file = event.target.files[0]
    },
    async upload() {
      try {
        const formData = new FormData();
        formData.append('photo', this.file, this.file.name)
        let r1 = await axios.post('/api/photos', formData);
        //inside post used to be '/api/books'
        let r2 = await axios.post(`/api/users/${this.user._id}/books`, {
          title: this.title,
          series: this.series,
          author: this.author,
          path: r1.data.path
        });
        this.addBook = r2.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getBooks() {
      console.log("getBooksAttempted");
      try {
        let response = await axios.get(`/api/users/${this.$root.$data.currentUser._id}/books`);
        this.books = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    selectBook(book) {
      this.findTitle = "";
      this.findBook = book;
    },
    async deleteBook(book) {
      try {
        await axios.delete(`/api/users/${this.user._id}/books/${book._id}`);
        this.findBook = null;
        this.getBooks();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async editBook(book) {
      try {
        await axios.put(`/api/users/${this.user._id}/books/${book._id}`, {
          title: this.findBook.title,
          series: this.findBook.series,
          author: this.findBook.author,
        });
        this.findBook = null;
        this.getBooks();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
  },

}
</script>

<style scoped>
.image h2 {
  font-style: italic;
  display: inline;
}

.image p {
  font-size: 10px;
  display: inline;
}

.heading {
  display: flex;
  margin-bottom: 20px;
  margin-top: 20px;
}

.heading h2 {
  margin-top: 8px;
  margin-left: 10px;
}

.add,
.edit {
  display: flex;
}

.circle {
  border-radius: 50%;
  width: 18px;
  height: 18px;
  padding: 8px;
  background: #333;
  color: #fff;
  text-align: center
}

/* Form */
input,
textarea,
select,
button {
  font-family: 'Montserrat', sans-serif;
  font-size: 1em;
}

.form {
  margin-right: 50px;
}

/* Uploaded images */
.upload h2 {
  margin: 0px;
  display: inline;
}

.upload p {
  margin: 0px;
  padding: 0px;
  font-size: 10px;
}

.upload img {
  max-width: 300px;
}

/* Suggestions */
.suggestions {
  width: 200px;
  border: 1px solid #ccc;
}

.suggestion {
  min-height: 20px;
}

.suggestion:hover {
  background-color: #5BDEFF;
  color: #fff;
}
</style>
