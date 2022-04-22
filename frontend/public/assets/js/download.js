import { Storage } from "@google-cloud/storage"
const path = require('path');
const cwd = path.join(__dirname, '..');

function main(
  bucketName = "pftc00001.appspot.com",
  fileName = 'completed/undefined',
  destFileName = path.join(cwd, 'downloaded.pdf')
) {
  // [START storage_download_file]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // The ID of your GCS file
  // const fileName = 'your-file-name';

  // The path to which the file should be downloaded
  // const destFileName = '/local/path/to/file.txt';

  // Imports the Google Cloud client library


  // Creates a client
  const storage = new Storage();

  async function downloadFile() {
    const options = {
      destination: destFileName,
    };

    // Downloads the file
    await storage.bucket(bucketName).file(fileName).download(options);

    console.log(
      `gs://${bucketName}/${fileName} downloaded to ${destFileName}.`
    );
  }

  downloadFile().catch(console.error);
  // [END storage_download_file]
}
main(...process.argv.slice(2));