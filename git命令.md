# Git命令

* 初始化     git init
* 将代码提交至暂存区      
  * git add -A     提交所有修改、新增与删除（git add --all的缩写）
  * git add -u     仅提交已经被add的文件（git add --update的缩写）
  * git add .        提交所有修改、新增
* 将代码提交至版本库
  * git commit -m "log"（-m 参数表示可以直接输入后面的“message”，如果不加 -m参数，那么是不能直接输入message的，而是会调用一个编辑器一般是vim来让你输入这个message）
* 将代码提交至远程库
  * git push -u origin master
* 将代码从远程仓库合并到本地仓库
  * git fetch origin master     从远程origin仓库的master分支下载代码到本地的origin master
  * git log -p master.. origin/master    比较本地仓库与远程仓库的区别
  * git merge origin/master    把远程仓库的代码合并到本地仓库
