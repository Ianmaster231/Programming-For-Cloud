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

const download = (e) => {
  e.preventDefault();
  // Remote URL for the file to be downloaded
  const url = 'pftc00001.appspot.com/completed/';
  const filename = req.file.originalname+'.pdf';

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobURL;
      a.style.display = 'none';

      if (filename && filename.length) a.download = filename;
      document.body.appendChild(a);
      a.click();
    })
    .catch((error) => {
      console.error(error);
    });
};
