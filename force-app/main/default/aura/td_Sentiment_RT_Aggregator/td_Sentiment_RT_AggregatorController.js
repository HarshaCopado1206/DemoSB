({
  doInit: function(cmp, event, helper) {
    var action = cmp.get("c.getSentimentStatus");
    action.setParam("recordId", cmp.get("v.recordId"));
    action.setParam("obj", cmp.get("v.obj"));

    console.log(cmp.get("v.obj"));
    console.log(cmp.get("v.recordId"));

    action.setCallback(this, function(res) {
      let state = res.getState();
      let retVal = res.getReturnValue();
      console.log("return value");
      console.log(retVal);

      if (state === "SUCCESS") {
        if (retVal.Positive_Sentiment__c != null) {
          cmp.set("v.positive", retVal.Positive_Sentiment__c);
          cmp.set("v.negative", retVal.Negative_Sentiment__c);
          cmp.set("v.neutral", retVal.Neutral_Sentiment__c);

          // document.querySelector("[data-id='neutral']").style.opacity =
          //   cmp.get("v.neutral") + "%";

          // document.querySelector("[data-id='positive']").style.opacity =
          //   cmp.get("v.positive") + "%";

          // document.querySelector("[data-id='negative']").style.opacity =
          //   cmp.get("v.negative") + "%";
        // } else {
        //   document.querySelector("[data-id='neutral']").style.opacity = "0%";

        //   document.querySelector("[data-id='positive']").style.opacity = "0%";

        //   document.querySelector("[data-id='negative']").style.opacity = "0%";
        }
      }
    });

    $A.enqueueAction(action);

    helper.subscribeToVoiceToolkit(cmp);
  },

  onDestroy: function(cmp, event, helper) {
    helper.unsubscribeFromVoiceToolkit(cmp);
  },

  // Chat Transcript Customer
  onChatTranscriptCustomer: function(cmp, evt, helper) {
    helper.chatConversationEventListener(cmp, evt, "EndUser");
  },

  // Chat Transcript Agent
  onChatTranscriptAgent: function(cmp, evt, helper) {
    helper.chatConversationEventListener(cmp, evt, "Agent");
  }
});