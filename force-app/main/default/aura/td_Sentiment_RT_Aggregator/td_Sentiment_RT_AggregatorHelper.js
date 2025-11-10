({
  subscribeToVoiceToolkit: function(cmp) {
    cmp._conversationEventListener = $A.getCallback(
      this.voiceConversationEventListener.bind(this, cmp)
    );
    cmp
      .find("voiceToolkitApi")
      .addConversationEventListener(
        "TRANSCRIPT",
        cmp._conversationEventListener
      );
  },

  unsubscribeFromVoiceToolkit: function(cmp) {
    cmp
      .find("voiceToolkitApi")
      .removeConversationEventListener(
        "TRANSCRIPT",
        cmp._conversationEventListener
      );
  },

  // Voice Transcripts (Customer and Agent)
  voiceConversationEventListener: function(cmp, transcript) {
    var transcriptText = transcript.detail.content.text;
    var speaker = transcript.detail.sender.role;
    var recordId = cmp.get("v.recordId");
    //Confirm that the component is on a Voice Call Record page
    if (recordId.startsWith("0LQ")) {
      this.runCustomFuntion(cmp, transcriptText, speaker);
    }
  },
  // Chat/Messaging Transcripts (Customer and Agent)
  chatConversationEventListener: function(cmp, evt, speaker) {
    var transcriptText = evt.getParam("content");
    var recordId = cmp.get("v.recordId");
    var chatRecordId = evt.getParam("recordId");
    //Confirm that the Event came from the Chat that the component is on
    if (recordId.includes(chatRecordId)) {
      this.runCustomFuntion(cmp, transcriptText, speaker);
    }
  },

  runCustomFuntion: function(cmp, transcriptText, speaker) {

    console.log(speaker);

    console.log("event happening here");

    if (speaker === "EndUser") {
      var message;
      if (cmp.get("v.transcriptProgress") === undefined) {
        message = transcriptText;
      } else {
        message = cmp.get("v.transcriptProgress") + " " + transcriptText;
      }


      console.log(message);

      cmp.set("v.transcriptProgress", message);


      var recordId = cmp.get("v.recordId");
      var username = cmp.get("v.username");
      var model = cmp.get("v.sentimentModelId");

      // console.log(transcriptText);
      // console.log(username);
      // console.log(model);

      // console.log(cmp.get("v.recordId"));
      // console.log(cmp.get("v.obj"));



      var actionNew = cmp.get("c.addRealTimeSentiment");

      actionNew.setParam("recordId", recordId);
      actionNew.setParam("obj", cmp.get("v.obj"));
      actionNew.setParam("message", transcriptText);
      actionNew.setParam("username", username);
      actionNew.setParam("model", model);

      actionNew.setCallback(this, function(res) {
        let state = res.getState();
        let retVal = res.getReturnValue();
        console.log("return of individual sentiment value");
        console.log(retVal);

        if (state === "SUCCESS") {
          if (retVal) {
            console.log("saved");
          }
        }
        else{
          console.log("failed");
        }
      });

      $A.enqueueAction(actionNew);

      var action = cmp.get("c.getSentiment");
      action.setParam("text", message);
      action.setParam("recordId", recordId);
      action.setParam("username", username);
      action.setParam("model", model);

      action.setCallback(this, function(res) {
        let state = res.getState();
        let retVal = res.getReturnValue();
        console.log("return value");
        console.log(retVal);

        if (state === "SUCCESS") {
          if (retVal) {
            // cmp.set('v.helperList', retVal);
            var res = JSON.parse(retVal);
            console.log(res);

            for (var i = 0; i < 3; i++) {
              if (res.probabilities[i].label === "neutral") {
                //   console.log("neutral");
                //   console.log(res.probabilities[i].probability);
                cmp.set(
                  "v.neutral",
                  (res.probabilities[i].probability * 100).toFixed(2)
                );
              } else if (res.probabilities[i].label === "positive") {
                cmp.set(
                  "v.positive",
                  (res.probabilities[i].probability * 100).toFixed(2)
                );
              } else {
                cmp.set(
                  "v.negative",
                  (res.probabilities[i].probability * 100).toFixed(2)
                );
              }
            }

            console.log(cmp.get("v.neutral"));
            console.log(cmp.get("v.positive"));
            console.log(cmp.get("v.negative"));

            var actionSave = cmp.get("c.updateProbability");

            actionSave.setParam("recordId", cmp.get("v.recordId"));
            actionSave.setParam("obj", cmp.get("v.obj"));

            actionSave.setParam("pos", cmp.get("v.positive"));
            actionSave.setParam("neg", cmp.get("v.negative"));
            actionSave.setParam("neut", cmp.get("v.neutral"));

            actionSave.setCallback(this, function(res) {
              let state = res.getState();
              let retVal = res.getReturnValue();
              console.log("return value");
              console.log(retVal);

              if (state === "SUCCESS") {
                if (retVal) {
                  console.log("saved");
                }
              }
            });

            $A.enqueueAction(actionSave);

          }
        }
      });

      $A.enqueueAction(action);
    }
  }
});