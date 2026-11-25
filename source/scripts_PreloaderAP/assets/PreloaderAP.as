package assets
{
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol53")]
   public dynamic class PreloaderAP extends MovieClip
   {
      
      public var done_mc:MovieClip;
      
      public function PreloaderAP()
      {
         super();
         addFrameScript(42,frame43);
      }
      
      internal function frame43() : *
      {
         stop();
      }
   }
}

