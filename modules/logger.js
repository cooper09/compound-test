var fs = require('fs');

const logger = async (text) => {
    console.log("logger: ", text );

    text = "\n"+text+"\n";

fs.appendFile("log.txt", text, err => {
    console.log("log entry: ", text )
    if (err) {
        console.log("cannot write to log file")
    }
})

}//end logger

module.exports.logger = logger;

//logger("at long last love")