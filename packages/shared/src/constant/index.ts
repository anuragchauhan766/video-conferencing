export const socketEvents = {
  ROUTERTPCAPABILITY: "routerTpcCapability",
  STARTMEETING: "startMeeting",
  ANSWERMEETING: "answerMeeting",
  JOINMEETING: "joinMeeting",
  DISCONNECT: "disconnect",
  USERJOINED: "userJoined",
  CALLUSER: "callUser",
  INCOMMINGCALL: "incommingCall",
  CALLACCEPTED: "callAccepted",
  NEGOITATION: "negotiation",
  NEGOTIATIONACCEPTED: "negotiationAccepted",
  GETLISTOFUSERS: "getlistofUsers",
} as const;
