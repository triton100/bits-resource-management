//    <div className="space-y-2">
//                   <Label htmlFor="target-date" className="text-sm font-medium text-gray-700">
//                     Target Completion Date (Optional)
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="target-date"
//                       type="date"
//                       value={createForm.targetDate}
//                       onChange={(e) => setCreateForm((prev) => ({ ...prev, targetDate: e.target.value }))}
//                       className="border-gray-300 pl-10"
//                     />
//                     <CalendarIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//                   </div>
//                 </div>



//           <Popover>
//   <PopoverTrigger asChild>
//     <Button variant="outline" className="w-full justify-start text-left font-normal border-gray-300">
//       <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
//       {createForm.targetDate ? format(new Date(createForm.targetDate), "PPP") : <span>Pick a date</span>}
//     </Button>
//   </PopoverTrigger>
//   <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-xl">
//     <Calendar
//       mode="single"
//       selected={createForm.targetDate ? new Date(createForm.targetDate) : undefined}
//       onSelect={(date) =>
//         setCreateForm((prev) => ({ ...prev, targetDate: date?.toISOString().split("T")[0] || "" }))
//       }
//     />
//   </PopoverContent>
// </Popover>