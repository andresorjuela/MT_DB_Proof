import { ApiError } from "../../Api.js";
export default {
  data: function() {
    return {
      in_process: 0,
      error: null,
      message: null,
    }
  },
  computed: {
    busy: function(){ return this.in_process > 0; },
    hasError: function(){ return this.error ? true : false; },
    hasMessage: function(){ return this.message ? true : false; },
  },
  methods: {
    handleApiError: function(err){
      console.error(err);
      if( err instanceof ApiError){
        this.message = err.message;
        this.error = err.error;
      } else {
        throw err;
      }
    }
  }
}