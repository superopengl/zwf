# zwf-website
ZWF portal website


DevNotes:

1. Generate self-signed ssl certificate https://letsencrypt.org/docs/certificates-for-localhost/

2. Find local postgresql data directory https://dba.stackexchange.com/questions/1350/how-do-i-find-postgresqls-data-directory

# Subscription flow (state logic)

1. When a user joins (register as org owner), a 15 day free trial plan will be granted automatically
2. Upgrade the trial plan to monthly subscription when
    1.  a successful purchase happens during the 15 days, or
    2.  a valid primary payment method is setup and the trial period expires
3. Freeze the org accounts when
    1. no purchase happens during the 15 day trial period, or
    2. no valid primary payment method is setup and the trial period expires
4. Continue the monthly subscription when 
    1. user manually changes subscription when previous subscription is alive, or
    2. it successfully run through the auto-renew payment at the end of previous monthly subscription
5. Downgrade to overdue-one-month subscription when 
    1. it fails to run through the auto-renew payment at the end of previous monthly subscription
6. Upgrade back to normal monthly subscription when
    1. a primary payment method is fixed during the one-month peace time, and
    2. the owned amount is paid successfully (daily based calculated)
    3. a new monthly purchase is successfully.
7. Freeze the org accounts when
    1. no valid primary payment method till the end of the one-month peace time.
8. Unfreeze the org accounts and upgrade back to monthly subscription when
    1. The org owner manually fix the primary payment method and 
    2. the owned amount is paid successfully (one month)
    3. a new monthly purchase is successfully.


```shell
docker builder prune
```