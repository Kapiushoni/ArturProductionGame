package assets
{
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol67")]
   public dynamic class loadingJacky extends MovieClip
   {
      
      public var textContainer:MovieClip;
      
      public function loadingJacky()
      {
         super();
         addFrameScript(96,this.frame97,110,this.frame111);
      }
      
      internal function frame97() : *
      {
         gotoAndPlay("idle");
      }
      
      internal function frame111() : *
      {
         stop();
      }
   }
}

