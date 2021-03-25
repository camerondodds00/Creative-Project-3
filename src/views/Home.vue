<template>
  <div class="home">
    <bookCollection :collection="collection" />
  </div>
</template>

<script>
// @ is an alias to /src
import bookCollection from '@/components/bookCollection.vue'

export default {
  name: 'Home',
  components: {
    bookCollection
  },
  data() {
    return {
    }
  },
  computed: {
    collection() {
      return this.$root.$data.collection;
    }
  }
}
</script>
