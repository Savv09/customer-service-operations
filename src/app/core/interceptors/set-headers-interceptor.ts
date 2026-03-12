import { HttpInterceptorFn } from '@angular/common/http';

export const setHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const request = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(request);
};
