/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const SKILL_NAME = "kens birthday reminder";

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, to my birthday reminder! Say Store and then the person\'s name to get started or simply say Help. Who\'s birthday would you like to remember?';

        //Declare session variables
        var sessionAttributes; //Declaring and initializing session attributes
         sessionAttributes = {
             "birthdayName": '',
         };
         
         handlerInput.attributesManager.setSessionAttributes(sessionAttributes); //Commit the sessions attributes
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AskBirthdayNameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskBirthdayNameIntent';
    },
    handle(handlerInput) {
        
       var birthdayName = handlerInput.requestEnvelope.request.intent.slots.birthdayName.value;       //read the birthdayName from the slot 
        
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();  //get the session variables

        sessionAttributes.birthdayName = birthdayName; //update the birthdayName variable  
        
        
        
        
        
        const speakOutput = "What is the day and month of " + birthdayName + "'s birthday";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()//'add a reprompt if you want to keep the session open for the user to respond'
            .getResponse();
    }
};




const StoreBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StoreBirthdayIntent';
    },
    handle(handlerInput) {

        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();  			//get the session variables
        var dayOfBirth = handlerInput.requestEnvelope.request.intent.slots.dayOfBirth.value;       	//read the dayOfBirth from the slot
        var monthOfBirth = handlerInput.requestEnvelope.request.intent.slots.monthOfBirth.value;	//read the monthOfBirth from the slot

        var birthdayName = sessionAttributes.birthdayName;  //retrieve the birthdayName session variable.
        const speakOutput = "Storing " + birthdayName + "'s birthday " + monthOfBirth + " " + dayOfBirth + " to database.";
               
        
       //dynamodb
       var AWS = require('aws-sdk');
       var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
       AWS.config.update({region: 'us-east-1'});
       
       var params = {
         TableName: '9704c282-efd3-4759-9598-095733d0dc72', //place the correct table name associaded with your alexa hosted skill here as was demonstrated in the video demonstration.
         Item: {
             'id' : {S: birthdayName},
             'day' : {N: dayOfBirth},
             'month' : {S: monthOfBirth},
         }
       };
       
       //Save thing to table using put item
       ddb.putItem(params, function(err, data){
         if(err){
           console.log(err);
         } else{
           console.log('Success');
         }
       });

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt()
            .withSimpleCard(SKILL_NAME, speakOutput)   //added to generate video output.
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Simply say Store followed by the name of the person\'s birthday that you would like to remember, then follow the audible instructions.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AskBirthdayNameIntentHandler,
        StoreBirthdayIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();