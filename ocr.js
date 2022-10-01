import { createWorker } from 'tesseract.js';

 function Ocr() {
    const worker = createWorker({
        logger: m => console.log(m),
    });

    let img = "";

    
    let ocr = ""; 
    
    const handleChange = async (event) => {
        // setImagePath(URL.createObjectURL(event.target.files[0]))
        img = URL.createObjectURL(event.target.files[0])
        console.log(img)
        ocr = await doOCR();
    }

    const doOCR = async () => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(img);
        console.log(text);
        return text;
    };

    const handleClick = async () => {
        ocr = await doOCR();
    }


    return (
        <div className="App">
            <main className="App-main">
                <h3>Actual imagePath uploaded</h3>
                <img
                    src={imagePath} className="App-image" alt="logo" />

                <h3>Extracted text</h3>
                <div className="text-box">
                    <p> {ocr} </p>
                </div>
                <input type="file" onChange={handleChange} />
                <button onClick={handleClick} style={{ height: 50 }}> convert to text</button>
            </main>
        </div>
    );
}