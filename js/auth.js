// Pastikan jQuery sudah di-load sebelum script ini
$("#loginForm").submit(function (e) {
  e.preventDefault();
  
  const email = $("#exampleInputEmail").val();
  const password = $("#exampleInputPassword").val();

  if (!email || !password) {
    alert("Email dan password wajib diisi");
    return;
  }

  $.ajax({
    url: `${host}/api/login`,
    method: "POST",
    contentType: "application/json",       // kirim raw JSON
    data: JSON.stringify({ email, password }),
    dataType: "json",                       // parse JSON otomatis
    success: function (res) {
      if (res.meta?.status !== "success") {
        alert(res.meta?.message || "Login gagal");
        return;
      }

      console.log('hha');
      

      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      console.log("User logged in:", user);

      // Redirect ke dashboard
      window.location.href = `${host}/`;
    },
    error: function (xhr) {
      let msg = "Login gagal";
      try {
        msg = xhr.responseJSON?.message || JSON.parse(xhr.responseText)?.message || msg;
      } catch (e) {}
      alert(msg);
    }
  });
});

 $(document).on("click", "#logoutBtn", function (e) {
  e.preventDefault();
   localStorage.removeItem("user");
   
  window.location.replace(host+"/login");
});
