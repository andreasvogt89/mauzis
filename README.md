# Mauzis

## TODO 
- [ ] Create a simple frontend
- [ ] Handle state of all household things

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

Copy in Unraid
```
cp /boot/config/plugins/dockerMAn/templates-user/my-Mauzis.xml /boot/config/plugins/community.applications/private/myrepo
```
