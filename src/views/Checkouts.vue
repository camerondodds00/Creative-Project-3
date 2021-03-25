<template>
<div>
  <h1> Your Checkouts </h1>

  <h1 v-if="this.$root.$data.circulating.length === 0"> You haven't checked anything out yet! </h1>

  <div class="checkout-container">
    <div class="checkout-item" v-for="book in circulating" :key="book.id">

      <div class="image">
        <img :src="'/images/'+book.image">
      </div>

      <div class="info">
      <h8> Title: {{book.name}}</h8>
      <p> Series: {{book.series}} </p>
      <p> Author: {{book.author}} </p>
      </div>
      <div class="format-button">
      <button class="auto" v-on:click="returnBook(book.id)">Return Book</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'Checkouts',
  components: {},
  data() {
    return {}
  },
  computed: {
    circulating() {
      return this.$root.$data.circulating;
    }
  },
  methods: {
    returnBook(itemID) {
      for (let index = 0; index < this.$root.$data.circulating.length; index++) {
        if (this.$root.$data.circulating[index].id === itemID) {
          this.$root.$data.circulating.splice(index, 1);
          break;
        }
      }
    }
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
  margin-left: 100px;
  margin-right: 100px;
  width: 200px;
}

.checkout-item img {
  border: 2px solid #333;
  height: 250px;
  width: 200px;
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

.format-button {

}

.auto {
  margin-left: auto;
}
</style>
