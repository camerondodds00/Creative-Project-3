<template>
<div>
  <h1> Browse Selection </h1>

  <div class="checkout-container">
    <div class="checkout-item" v-for="book in collection" :key="book.id">

      <div class="image">
        <img :src="'/images/'+book.image">
      </div>

      <div class="info">
      <h8> {{book.name}}</h8>
      <p> Series: {{book.series}} </p>
      <p> Author: {{book.author}} </p>
      <p> Average Rating: {{average(book.id)}} </p>
      <star-rating @rating-selected="setRating" v-on:click="setID(book.id)" v-bind:increment="0.5" v-bind:show-rating="false" v-bind:star-size="30" active-color="#F20056"></star-rating>
      <button class="submitRating" v-on:click="setID(book.id)"> Submit Rating </button>
      </div>
      <div class="format-button">
      <button class="auto" v-on:click="checkoutBook(book)">Checkout Book</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'bookCollection',
  props: {
    collection: Array
  },
  methods: {
    average(bookID) {
      if (!(bookID in this.ratings)) {
        return '';
      } else {
        let averageRating = this.ratings[bookID].sum / this.ratings[bookID].total;
        return (averageRating).toFixed(1);
      }
    },
    checkoutBook(book) {
      this.$root.$data.circulating.push(book);
    },
    setRating(rating){
      this.currentRating=rating;
    },
    setID(bookID) {
      this.currentID=bookID;
      if (!(this.currentID in this.ratings))
        this.$set(this.ratings, this.currentID, {
          sum: 0,
          total: 0
        });
      this.ratings[this.currentID].sum += this.currentRating;
      this.ratings[this.currentID].total += 1;
    }
  },
  data() {
    return {
      currentID: '',
      currentRating: '',
      ratings: {},
    }
  },
  components: {

  },
  computed: {
    /*
    average(bookID) {
      if (!(bookID in this.ratings)) {
        return '';
      } else {
        let averageRating = this.ratings[bookID].sum / this.ratings[bookID].total;
        return (averageRating).toFixed(1);
      }
    },
    */
  }
}
</script>

<style scoped>

p{
  font-size: 40 px;
}

.priceFormat {
  background: #F2921D;
  color: #000;
  height:20px;
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
  height: 180px;
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

.format-button {

}

.auto {
  margin-left: auto;
}
.submitRating {
  font-sie: 20px;
}
</style>
