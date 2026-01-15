import fetch from 'node-fetch';
import formData from "form-data";
import { fileTypeFromBuffer } from 'file-type'

/**
 * Upload image to telegra.ph
 * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`s
 * @param {Buffer} buffer Image Buffer
 * @return {Promise<string>}
 */
 export default async buffer => {
    let {
        ext
    } = await fileTypeFromBuffer(buffer);
    let bodyForm = new formData();
    bodyForm.append("fileToUpload", buffer, "file." + ext);
    bodyForm.append("reqtype", "fileupload");

    let res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: bodyForm,
    });

    let data = await res.text();
    return data;
}