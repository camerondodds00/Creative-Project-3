<template>
  <div class="home">
    <h1 v-if="this.$root.$data.currentUser"> Browse Selection </h1>
    <h1 v-else> Sign in to view our collection </h1>

    <div class="checkout-container">
      <div class="checkout-item" v-for="book in books" :key="book.id">

        <div class="image">
          <img :src="book.path" />
        </div>

        <div class="info">
          <h8> {{book.title}}</h8>
          <p> Series: {{book.series}} </p>
          <p> Author: {{book.author}} </p>
            <p> success </p>
          <p v-if="book.user.username === 'Admin'">Status: Available</p>
          <p v-else>Status: Checked Out</p>
        </div>
        <div class="format-button">
          <div v-if="book.user.username === 'Admin'">
          <button class="auto" v-on:click="checkoutBook(book)">Checkout Book</button>
        </div>
      </div>

      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
//import bookCollection from '@/components/bookCollection.vue'
import axios from 'axios';
export default {
  name: 'Home',
  data() {
    return {
      books: [],
      currentID: '',
      currentRating: '',
      ratings: {},
      user: null,
    }
  },
  created() {
    this.user = this.$root.$data.currentUser;
    this.getBooks();
  },
  props: {
    collection: Array
  },
  methods: {
    async getBooks() {
      try {
        let response = await axios.get(`/api/users/${this.$root.$data.currentUser._id}/books`);
        this.books = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    average(bookID) {
      if (!(bookID in this.ratings)) {
        return '';
      } else {
        let averageRating = this.ratings[bookID].sum / this.ratings[bookID].total;
        return (averageRating).toFixed(1);
      }
    },
    async checkoutBook(book) {
      try {
        await axios.put(`/api/users/${this.user._id}/checkouts/${book._id}`, {
        });
        this.getBooks();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    setRating(rating) {
      this.currentRating = rating;
    },
    setID(bookID) {
      this.currentID = bookID;
      if (!(this.currentID in this.ratings))
        this.$set(this.ratings, this.currentID, {
          sum: 0,
          total: 0
        });
      this.ratings[this.currentID].sum += this.currentRating;
      this.ratings[this.currentID].total += 1;
    }
  },
  components: {

  },
  computed: {

  }
}
</script>


<style scoped>
p {
  font-size: 40 px;
}

.priceFormat {
  background: #F2921D;
  color: #000;
  height: 20px;
  text-align: center;
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkout-container {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.checkout-item {
  margin: 10px;
  margin-top: 50px;
  margin-left: 50px;
  margin-right: 50px;

  width: 225px;
}

.checkout-item img {
  border: 2px solid #333;
  height: 300px;
  width: 225px;
  object-fit: cover;
}

.checkout-item .image {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}

.info {
  background: #EBCA97;
  color: #000;
  padding: 10px 30px;
  height: 100px;
}

.info h1 {
  font-size: 16px;
}

.info h2 {
  font-size: 14px;
}

.info p {
  margin: 0px;
  font-size: 10px;
}


.price {
  display: flex;
}

button {
  height: 50px;
  background: #000;
  color: white;
  border: none;
}

.format-buttonOne {
  display:flex;
}
.format-button {
  display:flex;
}

.auto {
  margin-left: auto;
}

.submitRating {
  font-sie: 20px;
}
</style>
