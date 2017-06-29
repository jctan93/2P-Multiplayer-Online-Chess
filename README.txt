//Comments and code for debugging have not been cleaned up yet.
//Requires node.js to be installed to run properly

An online multiplayer chess game written with javascript/node.js
Features:
- Users can register and login
- Lobby selection
- Global and private chat
- Spectate function available

> To run this without hosting it on a server, enter "node index.js" in a command line window opened in this directory
> Next. navigate to localhost:3000 in your browser to reach the login page

An instance of this webapp is hosted at https://thomasthedankengine.herokuapp.com/

--------------------
>> Means it is a feature that was implemented from "TO BE ADDED IN THE FUTURE" 

Update 1 - 09/04/2017:
> Added mobile friendly stylesheet
> Fixed broken move text input button
> Added feature where the spectators/other player can see which square the active player has clicked

Update 2 - 11/04/2017:
>> Global chat on login page which doesn't require chat users to be logged in

TO BE ADDED IN THE FUTURE:
> Direct messages to users (besides global and match private chat)
> Password reset option (registration will need to be overhauled, will require users to enter emails)

-------------------
BUGS

> Allows access for a split second even without a login cookie
