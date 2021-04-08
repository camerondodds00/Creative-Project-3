<template>
<div class="admin">
  <h1>The Users Page!</h1>
  <div class="heading">
    <div class="circle">1</div>
    <h2>Sign in</h2>          <!-- Code below is for sign in information -->
  </div>
  <div class="edit">
    <div class="form">
      <input v-model="findTitle" placeholder="Search">
      <div class="suggestions" v-if="suggestions.length > 0">
        <div class="suggestion" v-for="s in suggestions" :key="s.id" @click="pickUser(s)">{{s.username}}
        </div>
      </div>
    </div>
    <div class="upload" v-if="signUser">
      <input v-model="signUser.username" placeholder="Edit Title">
      <p></p>
    </div>
    <div class="actions" v-if="signUser">
      <button @click="logUser(signUser)">Log in to the library</button> <!-- Logs a user into the system -->
    </div>
  </div>

  <div class="heading">
    <div class="circle">2</div>
    <h2>Add a User</h2>     <!-- Code below is for adding a user -->
  </div>
  <div class="add">
    <div class="form">
      <input v-model="username" placeholder="Username">
      <p></p>
      <button @click="upload">Upload</button>
    </div>
    <div class="upload" v-if="addUser">
      <h2>{{addUser.username}}:</h2>
    </div>
  </div>

  <div class="heading">
    <div class="circle">3</div>
    <h2>Edit/Delete a User</h2>   <!-- Code below is for editing user information -->
  </div>
  <div class="edit">
    <div class="form">
      <input v-model="findTitle" placeholder="Search">
      <div class="suggestions" v-if="suggestions.length > 0">
        <div class="suggestion" v-for="s in suggestions" :key="s.id" @click="selectUser(s)">{{s.username}}
        </div>
      </div>
    </div>
    <div class="upload" v-if="findUser">
      <input v-model="findUser.username" placeholder="Edit Title">
      <p></p>
      <img :src="findUser.path" />
    </div>
    <div class="actions" v-if="findUser">
      <button @click="deleteUser(findUser)">Delete</button>
      <button @click="editUser(findUser)">Edit</button>
    </div>
  </div>

</div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Admin',
  data() {
    return {
      username: "",
      addUser: null,
      users: [],
      findTitle: "",
    findUser: null,
    signUser: null,
    }
  },
  computed: {
    suggestions() {
      let users = this.users.filter(user => user.username.toLowerCase().startsWith(this.findTitle.toLowerCase()));
      return users.sort((a, b) => a.username > b.username);
    }
  },
  created() {
    this.getUsers();
  },
  methods: {
    fileChanged(event) {
      this.file = event.target.files[0]
    },
    async upload() {
      try {
        let r2 = await axios.post('/api/users', {
          username: this.username,
        });
        this.addUser = r2.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getUsers() {
      try {
        let response = await axios.get("/api/users");
        this.users = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    selectUser(user) {
      this.findUser = user;
    },
    pickUser(user) {
      this.signUser = user;
    },
    async deleteUser(user) {
      try {
        await axios.delete("/api/users/" + user._id);
        this.findUser = null;
        this.$root.$data.currentUser = null;
        this.getUsers();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async editUser(user) {
      try {
        await axios.put("/api/users/" + user._id, {
          username: this.findUser.username,
        });
        this.$root.$data.currentUser = user;
        this.findUser = null;
        this.getUsers();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    logUser(user) {
      this.$root.$data.currentUser = user;
    }
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
