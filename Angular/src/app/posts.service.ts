import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { Post } from './post.model';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from  'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  error = new Subject<string>();


  constructor(private _http: HttpClient) { }

  createAndStorePost(title: string, content: string) {
    const postData: Post =  {title: title, content: content}
    this._http.post<{ name: string }>(
      'https://ng-complete-guide-d8a10.firebaseio.com/posts.json',
      postData,
      {
        observe: 'response'
      }
    )
    .subscribe(responseData => {
      console.log(responseData.body);
    }, error => {
      this.error.next(error.message);
    }); 
  }

  fetchPosts() {
    let  searchParams = new HttpParams();
    searchParams = searchParams.append('print','pretty');
    searchParams = searchParams.append('custom','key');
    return  this._http.get<{ [key: string]: Post}>(
      'https://ng-complete-guide-d8a10.firebaseio.com/posts.json',
      {
        headers: new HttpHeaders({ 'Custom-Header': 'Hello'}),
        params: searchParams,
        responseType: 'json'
      }
      )
    .pipe(
      map((responseData: {[key: string]: Post }) => {
      const postsArray: Post[] = [];
      for( const key in responseData) {
        if(responseData.hasOwnProperty(key)){
          postsArray.push({ ...responseData[key], id: key });
        }
      }
      return postsArray;
    }),
    catchError(errorRes => {
      // Send to analytics server 
      return throwError(errorRes);
    })
    )
  }

  deletePosts() {
    return this._http.delete('https://ng-complete-guide-d8a10.firebaseio.com/posts.json',
    {
      observe: 'events',
      responseType: 'text'
    }
    ).pipe(
      tap(event => {
      console.log(event);
      if(event.type === HttpEventType.Sent) {
        //.....
      }
      if(event.type === HttpEventType.Response) {
        console.log(event.body);
      }
    })
    );
  }
}
