from rest_framework import status
from rest_framework.response import Response

from utilities.konstants import K, Konstants

ERROR_CODE = Konstants(
    K(EXCEPTION=1001, label='Exception'),
    K(INVALID_SIGNUP=1002, label='Invalid signup'),
    K(INVALID_USER=1003, label='Invalid user details supplied'),
    K(INVALID_LOGIN=1004, label='Invalid login'),
    K(USER_EXISTS=1005, label='User Already exists'),
    K(INVALID_CODE=1006, label='Invalid code supplied'),
    K(INVALID_CREATE=1007, label='Invalid creation'),
    K(INVALID_UPDATE=1008, label='Invalid update'),
    K(UNKNOWN_QUERY=1009, label='Unknown object')
)


class ResponseViewMixin(object):
    ignore_keys = ['non_field_errors', ]

    def jp_response(self, s_code='HTTP_200_OK', data=None):
        return Response(status=getattr(status, s_code),
                        data={'status': getattr(status, s_code),
                              'data': data,
                              'success': True},
                        content_type='application/json'
                        )

    def jp_error_response(self, s_code='HTTP_500_INTERNAL_SERVER_ERROR', e_code='EXCEPTION', data=None):
        if type(data) is str:
            data = [data, ]

        return Response(status=getattr(status, s_code),
                        data={'status': getattr(status, s_code),
                              'error': {'code': getattr(ERROR_CODE, e_code),
                                        'message': data}},
                        content_type='application/json'
                        )

    def exception_response(self, data=None):
        return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', data)

    def error_msg_list(self, errors):
        errors_list = []
        for k, v in errors.items():
            if isinstance(v, dict):
                v = self.error_msg_list(v)
            for msg in v:
                if k in self.ignore_keys:
                    errors_list.append(msg)
                else:
                    errors_list.append(' '.join(k.title().split('_')) + '- ' + str(msg))
        return errors_list
