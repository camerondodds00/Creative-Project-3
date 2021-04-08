<template>
  <div class="home">
    <bookCollection :collection="collection" />
  </div>
</template>

<script>
// @ is an alias to /src
import bookCollection from '@/components/bookCollection.vue'
import axios from 'axios';
export default {
  name: 'Home',
  components: {
    bookCollection
  },
  data() {
    return {
      libraryCollection: [],
    }
  },
  created() {
     this.getBooks();
   },
   methods: {
     async getBooks() {
       try {
         let response = await axios.get(`/api/users/${this.$root.$data.currentUser._id}/books`);
         this.libraryCollection = response.data;
         return true;
       } catch (error) {
         console.log(error);
       }
     },
   },
  computed: {
    collection() {
      return this.libraryCollection;
    }
  }
}
</script>
