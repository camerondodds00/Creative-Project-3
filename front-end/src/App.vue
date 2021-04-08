<template>
<div id="app">
  <div id="menu">
    <div id="brand">
      <router-link to="/">
        <img src="/images/LibraryLogo.jpg">
        <p> Home </p>
      </router-link>
    </div>
    <div id="side">
      <router-link to="/Checkouts">
        <div class="menu-item browse">
          <img src="/images/checkout-clip.png">
          <p>View Checkouts</p>
        </div>
      </router-link>
      <router-link to="/Users">
        <div class="menu-item browse">
          <img src="/images/checkout-clip.png">
          <p v-if="this.$root.$data.currentUser">User: {{this.$root.$data.currentUser.username}}</p>
          <p v-else> User Settings </p>
        </div>
      </router-link>
      <router-link to="/Admin">
        <div class="menu-item browse">
          <img src="/images/checkout-clip.png">
          <p>Admin</p>
        </div>
      </router-link>
    </div>
  </div>
  <router-view />
  <div class="footer">
        <p><a href='https://github.com/camerondodds00/Creative-Project-4' target='_blank'>Github: @camerondodds00</a></p>
    </div>
</div>
</template>


<style>
* {
  box-sizing: border-box;
}

body {
  margin: 50px 100px;

}

.footer {
  height: 30px;
  width: 100%;
  bottom: 0;
  background-color: black;
  color: white;
  text-align: center;
}

a.footer {
  color: white;
}

a, a:hover, a:active, a:visited {
    color: white;
  }

#menu {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 5px;
  grid-template-areas: "none brand side";
}

#menu a {
  color: #EBCA97;
}

#brand {
  grid-area: brand;
  display: flex;
  justify-content: center;
}

#brand img {
  height: 200px;
}

#side {
  grid-area: side;
  display: flex;
  justify-content: right;
}

#side img {
  width: 50px;
  height: 80px;
}

.menu-item {
  display: flex;
  flex-direction: column;
}

.menu-item p {
  margin: 0px;
}

.browse {
  margin-right: 50px;
}

</style>
