

const uploadFile = async (reduceCredit) => {
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
  //idea was when the uploadfile is activated this would recude the credits value form the server
   async function reduceCredit(email){
    const docRef = db.collection("userData").doc(email).update({
      credits: FieldValue.increment(parseInt("-1"))
    });
    return true;
  }
  
  var element = document.getElementById('incrementText');
  var value = element.innerHTML;

  --value;
  document.getElementById('incrementText').innerHTML = value;
};


 

