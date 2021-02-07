# Mauzis

## TODO 
- [ ] Create a simple frontend
- [ ] Handle state of all household things
- [ ] create telegram reset for bowls

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
```
{"data":{"bowls":{"settings":[{"food_type":2,"target":10},{"food_type":1,"target":100}],"type":4},"fast_polling":true,"lid":{"close_delay":0},"tare":3,"training_mode":0},"results":[{"requestId":"1334549a-7004-4832-819e-53e1120636ce","responseId":"67c792f6-c2ef-1779-bc12-4314169a316f","status":0,"timeToSend":135,"timeToRespond":1357,"data":{"tare":3}}]}
```


Copy in Unraid
```
cp /boot/config/plugins/dockerMAn/templates-user/my-Mauzis.xml /boot/config/plugins/community.applications/private/myrepo
```
