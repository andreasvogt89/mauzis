# Mauzis
  ### This code is connectiong to the Sure Petcare server by a valid account and provieds some functions to interact with Petcare devices.
  
  ## Not finished yet!
  
## TODO
- [x] create connection to sure petcare with auto login interval
- [x] create door set function (api/telegram) 
- [ ] Create a simple frontend
- [x] Handle state of all household things (get by api)
- [x] create reset for bowls (api/telegram)

### Example of door lock/unlock response
```
{
  data: {
    curfew: { enabled: false, lock_time: '12:01', unlock_time: '12:02' },
    locking: 0,
    fast_polling: true
  },
  results: [
    {
      requestId: 'd04fb691-d684-4a65-a7ae-1f5c583d2f5e',
      responseId: '904e3233-b30b-bdd7-6d78-5835a08dbc19',
      status: 0,
      timeToSend: 111,
      timeToRespond: 3361,
      data: [Object]
    }
  ]
}

```
Copy in Unraid (Domain specific)
```
cp /boot/config/plugins/dockerMAn/templates-user/my-Mauzis.xml /boot/config/plugins/community.applications/private/myrepo
```
