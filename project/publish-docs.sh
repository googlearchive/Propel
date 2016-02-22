if [ "$TRAVIS_BRANCH" = "master" -a "$TRAVIS_PULL_REQUEST" = "false" ]
then
   echo "Not a test of the master branch, not deploying"
   exit 0
else
   echo "Lets deploy"
fi
