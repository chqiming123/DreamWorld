using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

namespace HttpRequestTest
{
    class Program
    {
        static void Main(string[] args)
        {
            string url="http://diapers.suryani.cn/login.qs";
            HttpWebRequest request = (HttpWebRequest) WebRequest.Create(url);                        
            request.CookieContainer=new CookieContainer();
            HttpWebResponse response = (HttpWebResponse) request.GetResponse();

            Stream responseStream = response.GetResponseStream();
            StreamReader reader=new StreamReader(responseStream,Encoding.UTF8);
            string html = reader.ReadToEnd();
            Console.Write(html);
            Console.ReadKey();
        }

    }
}
