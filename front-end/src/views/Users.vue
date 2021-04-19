<template>
<div class="admin">
  <h1>The Users Page!</h1>
  <div v-if="this.$root.$data.currentUser === null">
    <div class="heading">
      <div class="circle">1</div>
      <h2>Sign in</h2> <!-- Code below is for sign in information -->
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
        <input v-model="signUser.username" placeholder="Enter Username">
        <input v-model="signUser.password" placeholder="Enter Password">
        <p></p>
      </div>
      <div class="actions" v-if="signUser">
        <button @click="logIn(signUser)">Log in to the library</button> <!-- Logs a user into the system -->
      </div>
    </div>
    <div class="error" v-if="this.errorLogin">
      <h2> Error: </h2>
      <h4> {{errorLogin}} </h4>
    </div>
  </div>

  <!--Sign out-->
  <div v-if="this.$root.$data.currentUser != null">
    <div class="heading">
      <div class="circle">1</div>
      <h2>Sign out</h2> <!-- Code below is for sign in information -->
    </div>
    <div class="actions">
      <button @click="logOut()">Click here</button> <!-- Logs a user into the system -->
    </div>
  </div>

  <!-- Code below is for adding a user -->
  <div v-if="this.$root.$data.currentUser === null">
    <div class="heading">
      <div class="circle">2</div>
      <h2>New User</h2>
    </div>
    <div class="add">
      <div class="form">
        <input v-model="firstName" placeholder="firstName">
        <p></p>
        <input v-model="lastName" placeholder="lastName">
        <p></p>
        <input v-model="username" placeholder="Username">
        <p></p>
        <input v-model="password" placeholder="Password">
        <p></p>
        <button @click="upload">Upload</button>
      </div>
      <div class="upload" v-if="addUser">
        <h2>{{addUser.username}}:</h2>
      </div>
      <div class="upload" v-if="errorSignup">
        <h2>Error:</h2>
        <h4>{{errorSignup}}</h4>
      </div>
    </div>
  </div>

  <!-- Code below is for editing user information -->
  <!-- <div v-else-if="this.$root.$data.currentUser.username === 'Admin'"> -->
  <div v-if="this.$root.$data.currentUser === null">
  </div>
  <div v-else>
    <div class="heading">
      <div class="circle">3</div>
      <h2>Edit User Information</h2>
    </div>
    <!--Code to edit for an Admin -->
    <div class="edit" v-if="this.$root.$data.currentUser.username === 'Admin'">
      <div class="form">
        <input v-model="findTitle" placeholder="Search">
        <div class="suggestions" v-if="suggestions.length > 0">
          <div class="suggestion" v-for="s in suggestions" :key="s.id" @click="selectUser(s)">{{s.username}}
          </div>
        </div>
      </div>
      <div class="upload" v-if="findUser">
        <input v-model="findUser.firstName" placeholder="Edit First Name">
        <p></p>
        <input v-model="findUser.lastName" placeholder="Edit Last Name">
        <p></p>
        <input v-model="findUser.username" placeholder="Edit Username">
        <p></p>
      </div>
      <div class="actions" v-if="findUser">
        <button @click="editUser(findUser)">Edit</button>
        <button v-if="this.$root.$data.currentUser.username === 'Admin'" @click="deleteUser(findUser)">Delete</button>
      </div>
    </div>
    <!-- Code to edit for anybody else -->
    <div class="edit" v-if="this.$root.$data.currentUser.username != 'Admin'">
      <div v-if="findUser === null">
        <div class="actions">
          <button @click="selectCurrentUser()">Click here</button>
        </div>
      </div>
      <div class="upload" v-if="findUser">
        <input v-model="findUser.firstName" placeholder="Edit First Name">
        <p></p>
        <input v-model="findUser.lastName" placeholder="Edit Last Name">
        <p></p>
        <input v-model="findUser.username" placeholder="Edit Username">
        <p></p>
      </div>
      <div class="actions" v-if="findUser">
        <button @click="editUser(findUser)">Edit</button>
      </div>
    </div> <!-- end edit code-->

  </div>
</div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Admin',
  data() {
    return {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      addUser: null,
      users: [],
      booksToReturn: [],
      findTitle: "",
      findUser: null,
      signUser: null,
      errorLogin: "",
      errorSignup: "",
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
          firstName: this.firstName,
          lastName: this.lastName,
          username: this.username,
          password: this.password,
        });
        this.firstName = "";
        this.lastName = "";
        this.username = "";
        this.password = "";
        this.addUser = r2.data;
        this.getUsers();
      } catch (error) {
        this.errorSignup = error.response.data.message;
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
    selectCurrentUser() {
      this.findUser = this.$root.$data.currentUser;
    },
    selectUser(user) {
      this.findUser = user;
    },
    pickUser(user) {
      this.signUser = user;
    },
    async deleteUser(user) {
      //return the books that the user has checked out
      try {
        let response = await axios.get(`/api/users/${user._id}/checkouts`);
        this.booksToReturn = response.data;
        for (let i = 0; i < this.booksToReturn.length; i++) {
          await axios.put(`/api/users/${user._id}/return/${this.booksToReturn[i]._id}`, {});
        }
      } catch (error) {
        console.log(error);
      }
      //delete the user
      try {
        await axios.delete("/api/users/" + user._id);
        this.findUser = null;
        this.getUsers();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async editUser(user) {
      try {
        await axios.put("/api/users/" + user._id, {
          firstName: this.findUser.firstName,
          lastName: this.findUser.lastName,
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
    async logIn(user) {
      this.errorLogin = '';
      if (!user.username || !user.password)
        return;
      try {
        let response = await axios.post('/api/users/login', {
          username: user.username,
          password: user.password,
        });
        this.$root.$data.currentUser = response.data.user;
        this.password = "";
        console.log("success");
      } catch (error) {
        console.log("failure");
        this.password = "";
        this.errorLogin = error.response.data.message;
      }
    },

    logOut() {
      this.$root.$data.currentUser = null;
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

.error {
  margin-left: auto;
  margin-right: auto;
  width: 15em
}
</style>
