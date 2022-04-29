const uploadFile = async () => {
  const fileUpload = document.getElementById("fileInput").files[0];
  if (fileUpload) {
    var formData = new FormData();
    const url = `/upload`;
    const headers = {
      "Content-Type": "multipart/form-data",
      "Access-Control-Allow-Origin": "*",
    };
    formData.append("image", fileUpload);
    const response = await axios.post(url, formData, headers);
    console.log(response);
  }
};


  async function downloadFile() {
    const options = {
      destination: destFileName,
    };
  
    // Downloads the file
    await storage.bucket("pftc00001.appspot.com").file(req.filename).download(options);
}

