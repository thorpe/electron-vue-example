module.exports = {
  'stream': {
    'forceDownload': false,
    'random': false,
    'rootFolder': './videos/',
    'rootPath': '',
    'server': 'VidStreamer.js/0.1.4',
    'maxAge': '3600',
    'throttle': 1000000,
    'cors': true,
	  'onStreamOpen': null,
    'onStreamReport': null,
	  'onStreamClose': null,
	  'sessions': [],
    'report_stream': 2000000
  },
  'storage': {
    'controller_url': 'http://tstorage.chainflix.net:9001',
    'storage_id': '',
    'api_key': '',
    'size_max': 100,
    'port': 3001,
    'https_port': 3002,
    'uploadPath': './uploads/',
    'max_traffic': 100,
    'size_available': 0,
    'current_users': 0,
    'network_traffic': 0,
    'chunk_size': 32767
  },
  'cert': {
    'privatekey': '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDf3EB2ATiywFhn\nNAJuaqCbaqgDS78Ktxjivxpt5AZPo4I0fTp6wCoI5xqp2hVS40CElBw8fug5Y9Ox\nGc6y6z9K1I/tN6ZxDgAIKMdFBvLZ5iIaaf2O021go7uflO4WBG+Ism6UgWVvSw8u\nd+OX6DC5LkQutEtvTAu6v8LPc+UZPPGa+H6bnWyE9uDQm7zfmWvCRY9lUXE6cNlr\nsWM4oSVC+PuwS2KqtFlX1lozcjTDvDLiNVQ3npXyZLvCT6XOxeM9yHXOX6ykI4xX\n3v8jp6ZUMwZ2KKKkDdgG1mfyBD8nSKTGD9qzZEtUvFg5OcmI+7xdNewOyQZkNhlo\naVw7OAtPAgMBAAECggEAOlW03otW8Q26e7pL3+YdUCKtAZ7de7dW3s+Z3YUMN/iN\n14vCj3Y//e3rPtO7tsvNZj8KVKFldn8TDRWCjZFL/v4BO3nC/7b8PyQROWWkJzAX\nNvbjwjJKUGKaY+11VXt2bRLCSiSmACh5HkzTnCQ/fiIWVm1ZMvmIHPQXmePDkZ2Z\nFsMw4AuZS2khlshBN1zkRn3ASKhBihWNW5N+ZrMSHVMqfm4IPgp/wKB45PxT1Wkv\n3bRogBb67FcIJFjX8oSAz0Xk4Y4vmgCUtYug1L55OQ8aBBftiwcPPLuLoVsYaK2L\nm9GnbjORnrSIFf7SIpXRexmXRy+iwtaNrNb2Cg6H0QKBgQD7PrI6wb1KoLeL4yGl\n89HchD5V1KnkkRU2OcDl0DfMG3RAlPJ0lRE+UFxg8razf3vxsgiG1jRhEKi50wAv\nL8H3wtUdXUqb6Y3GkPddpGki735aMCVyKCNhnha6cV8Gn8OYxtaJ9rhd/INTR5G5\nRl0DePVYcTZn+C2rQ2TNVNkW6wKBgQDkGOACJWsR7VMxjWxMeJ/XYja7UBG8aixt\nXShu3Vd/dobcuHcUdTuHB9U10h4Y4T3OnvKElNaoy4UTqY/bLxfG2RPXchXq3HW2\nkz56P132fnQrbl3THJmh2ntB+vu3h0fSvpkNlXFRmAxOoIv4YABOctJN3sQG3ZPr\ngB4l5PQMLQKBgQCzfp5Mlf9LYrje6r0uV5v15FC4dz+NOQ2jeO1UAkbqvi52uTLi\nkWEJWNY2uRBH+ussyJmI4132frVcVN+L1p3ICVzCJtVXwCr20ri3IO+v8tQdUMpf\n3UcxxYTNXJOcIuXVrzC0zhv3oaCdDcORTzDCe1clAXTyIH9YHMTWYSjbUwKBgFGV\nuCHsYlSiL1yM+gyMJJf0UCFFbWKYE1X2uSyWTOKRcYFnFWii2ezdV1yN0CgUAHh0\nD8huOC1dxjaXMpYyTO3Z3Sf1bXN48T2hgvpUyfYNmt2h9zs4gpcKv4WFER2+7Gir\ntbDPIB4QJW7GK+pl5BYrKZ+iqzjNbkgQpjfloYjtAoGAQDMVwx9WVrJ4HA0rriUQ\nqp1inGBvkFa8G9Er0uvi12P4QJsP2bYYC5Q8QaaSe6Zm6ORBwlJ838hfuJZKQ6Yg\nB5MxgGhocFG/HKvLQPuXdjzTq7N++MacZP62RPix2SgmJ8bvQ/RVo5yvgwPwuoRn\nHBphBmc86Q8b/zwQ0V/958I=\n-----END PRIVATE KEY-----',
    'publickey': '-----BEGIN CERTIFICATE-----\nMIIFVzCCBD+gAwIBAgISA+hSUAeau1wdyEF3r+YZsX7XMA0GCSqGSIb3DQEBCwUA\nMEoxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MSMwIQYDVQQD\nExpMZXQncyBFbmNyeXB0IEF1dGhvcml0eSBYMzAeFw0yMDAzMjAwNDU4MTdaFw0y\nMDA2MTgwNDU4MTdaMBsxGTAXBgNVBAMMECouY2hhaW5mbGl4LmxpdmUwggEiMA0G\nCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDf3EB2ATiywFhnNAJuaqCbaqgDS78K\ntxjivxpt5AZPo4I0fTp6wCoI5xqp2hVS40CElBw8fug5Y9OxGc6y6z9K1I/tN6Zx\nDgAIKMdFBvLZ5iIaaf2O021go7uflO4WBG+Ism6UgWVvSw8ud+OX6DC5LkQutEtv\nTAu6v8LPc+UZPPGa+H6bnWyE9uDQm7zfmWvCRY9lUXE6cNlrsWM4oSVC+PuwS2Kq\ntFlX1lozcjTDvDLiNVQ3npXyZLvCT6XOxeM9yHXOX6ykI4xX3v8jp6ZUMwZ2KKKk\nDdgG1mfyBD8nSKTGD9qzZEtUvFg5OcmI+7xdNewOyQZkNhloaVw7OAtPAgMBAAGj\nggJkMIICYDAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsG\nAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFGGCscwHK8B72O/irTPYw9PY\nzuRWMB8GA1UdIwQYMBaAFKhKamMEfd265tE5t6ZFZe/zqOyhMG8GCCsGAQUFBwEB\nBGMwYTAuBggrBgEFBQcwAYYiaHR0cDovL29jc3AuaW50LXgzLmxldHNlbmNyeXB0\nLm9yZzAvBggrBgEFBQcwAoYjaHR0cDovL2NlcnQuaW50LXgzLmxldHNlbmNyeXB0\nLm9yZy8wGwYDVR0RBBQwEoIQKi5jaGFpbmZsaXgubGl2ZTBMBgNVHSAERTBDMAgG\nBmeBDAECATA3BgsrBgEEAYLfEwEBATAoMCYGCCsGAQUFBwIBFhpodHRwOi8vY3Bz\nLmxldHNlbmNyeXB0Lm9yZzCCAQMGCisGAQQB1nkCBAIEgfQEgfEA7wB2AOcS8rA3\nfhpi+47JDGGE8ep7N8tWHREmW/Pg80vyQVRuAAABcPaFVCQAAAQDAEcwRQIhAPNo\nB3elhT7nrpZGntwrJnz+1Y1nbekG0lrbY90NTaCKAiByLgQAlkSJaM/1EvE9mC4P\nrSwQjWSSMyJrIasV9t6SBAB1ALIeBcyLos2KIE6HZvkruYolIGdr2vpw57JJUy3v\ni5BeAAABcPaFVBkAAAQDAEYwRAIgNzk9+Ryeu6H5WS/RInbicNTVzAjaZlR1aExC\nyB5qC7oCIBjpJPpab2X3zVcxPw0+5eKnZ0mSxtyhIDqeUP4/CtmHMA0GCSqGSIb3\nDQEBCwUAA4IBAQBRz1VVai1WjOa4B91pc7lTlnKdFxX7WnaeIAKKzWzDh6srXJ93\n5Z363kUs6rqnsfFg7p6JjwJxaoKK/oYYXGYs7gdCPyn6gljNQ8zim/AqMGJ1dgN3\nltngYNAbIi3hIiXcjfPwnX8uNeP0ZjbgJ8b9kyDJXuLywiRrtn0O5uPSy1ENOg6W\nBJNzFJI+hX2T9xYDD+7zChnld/aZnkGDJEz2zpqW7CMjHvhhqkrguMlM1fCxdMO9\nmf5V3bWwFXLW9pS3QgdLpzKp/Z6NgcEi149iWLGP9qOIfFAeyfnpJueQDg8fiVPP\n9pHsC7Gvycm1NwugLMXbp0exEB8+uEk3uuKz\n-----END CERTIFICATE-----\n-----BEGIN CERTIFICATE-----\nMIIEkjCCA3qgAwIBAgIQCgFBQgAAAVOFc2oLheynCDANBgkqhkiG9w0BAQsFADA/\nMSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\nDkRTVCBSb290IENBIFgzMB4XDTE2MDMxNzE2NDA0NloXDTIxMDMxNzE2NDA0Nlow\nSjELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUxldCdzIEVuY3J5cHQxIzAhBgNVBAMT\nGkxldCdzIEVuY3J5cHQgQXV0aG9yaXR5IFgzMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEAnNMM8FrlLke3cl03g7NoYzDq1zUmGSXhvb418XCSL7e4S0EF\nq6meNQhY7LEqxGiHC6PjdeTm86dicbp5gWAf15Gan/PQeGdxyGkOlZHP/uaZ6WA8\nSMx+yk13EiSdRxta67nsHjcAHJyse6cF6s5K671B5TaYucv9bTyWaN8jKkKQDIZ0\nZ8h/pZq4UmEUEz9l6YKHy9v6Dlb2honzhT+Xhq+w3Brvaw2VFn3EK6BlspkENnWA\na6xK8xuQSXgvopZPKiAlKQTGdMDQMc2PMTiVFrqoM7hD8bEfwzB/onkxEz0tNvjj\n/PIzark5McWvxI0NHWQWM6r6hCm21AvA2H3DkwIDAQABo4IBfTCCAXkwEgYDVR0T\nAQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAYYwfwYIKwYBBQUHAQEEczBxMDIG\nCCsGAQUFBzABhiZodHRwOi8vaXNyZy50cnVzdGlkLm9jc3AuaWRlbnRydXN0LmNv\nbTA7BggrBgEFBQcwAoYvaHR0cDovL2FwcHMuaWRlbnRydXN0LmNvbS9yb290cy9k\nc3Ryb290Y2F4My5wN2MwHwYDVR0jBBgwFoAUxKexpHsscfrb4UuQdf/EFWCFiRAw\nVAYDVR0gBE0wSzAIBgZngQwBAgEwPwYLKwYBBAGC3xMBAQEwMDAuBggrBgEFBQcC\nARYiaHR0cDovL2Nwcy5yb290LXgxLmxldHNlbmNyeXB0Lm9yZzA8BgNVHR8ENTAz\nMDGgL6AthitodHRwOi8vY3JsLmlkZW50cnVzdC5jb20vRFNUUk9PVENBWDNDUkwu\nY3JsMB0GA1UdDgQWBBSoSmpjBH3duubRObemRWXv86jsoTANBgkqhkiG9w0BAQsF\nAAOCAQEA3TPXEfNjWDjdGBX7CVW+dla5cEilaUcne8IkCJLxWh9KEik3JHRRHGJo\nuM2VcGfl96S8TihRzZvoroed6ti6WqEBmtzw3Wodatg+VyOeph4EYpr/1wXKtx8/\nwApIvJSwtmVi4MFU5aMqrSDE6ea73Mj2tcMyo5jMd6jmeWUHK8so/joWUoHOUgwu\nX4Po1QYz+3dszkDqMp4fklxBwXRsW10KXzPMTZ+sOPAveyxindmjkW8lGy+QsRlG\nPfZ+G6Z6h7mjem0Y+iWlkYcV4PIWL1iwBi8saCbGS5jN2p8M+X+Q7UNKEkROb3N6\nKOqkqm57TH2H3eDJAkSnh6/DNFu0Qg==\n-----END CERTIFICATE-----'
  },
  'syncForward': {
  }
}
