import { download } from "./uploads.js";
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

  var element = document.getElementById('incrementText');
  var value = element.innerHTML;

  --value;
  document.getElementById('incrementText').innerHTML = value;
};

const downloadBTN = async() => {
  const downloadbutton = download;
}



 

